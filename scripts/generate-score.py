#!/usr/bin/env python3
"""
AinA MAXX demo score — procedural cinematic synth (no copyrighted audio).
3 minutes, 44.1kHz stereo WAV. Dark pad + pulse bass + arpeggio + risers
at scene boundaries + finale lift. Deterministic (seeded).
"""
import math
import os
import random
import struct
import wave

SR = 44100
DUR = 180.0
N = int(SR * DUR)
random.seed(42)

# stereo buffers
L = [0.0] * N
R = [0.0] * N


def add(idx, val, pan=0.0):
    if 0 <= idx < N:
        L[idx] += val * (1.0 - max(0.0, pan))
        R[idx] += val * (1.0 + min(0.0, pan))


def env(t, a, d, s_level, r, total):
    if t < a:
        return t / a if a > 0 else 1.0
    if t < a + d:
        return 1.0 - (1.0 - s_level) * ((t - a) / d if d > 0 else 1.0)
    if t < total - r:
        return s_level
    return s_level * max(0.0, (total - t) / r) if r > 0 else s_level


def tone(freq, start, dur, vol, pan=0.0, wave_type="sine", attack=0.01, decay=0.1, sustain=0.7, release=0.2, detune=0.0):
    s0 = int(start * SR)
    n = int(dur * SR)
    for i in range(n):
        t = i / SR
        ph = 2 * math.pi * freq * (1 + detune) * t
        if wave_type == "sine":
            v = math.sin(ph)
        elif wave_type == "tri":
            v = 2 * abs(2 * ((freq * (1 + detune) * t) % 1) - 1) - 1
        elif wave_type == "soft_saw":
            v = 0.6 * math.sin(ph) + 0.3 * math.sin(ph * 2) + 0.15 * math.sin(ph * 3)
        else:
            v = math.sin(ph)
        e = env(t, attack, decay, sustain, release, dur)
        add(s0 + i, v * vol * e, pan)


def noise_hit(start, dur, vol, pan=0.0, sweep_down=True):
    s0 = int(start * SR)
    n = int(dur * SR)
    lp = 0.0
    for i in range(n):
        t = i / SR
        w = random.uniform(-1, 1)
        cutoff = (1 - t / dur) if sweep_down else (t / dur)
        alpha = 0.02 + 0.5 * cutoff * cutoff
        lp += alpha * (w - lp)
        e = math.sin(math.pi * min(1.0, t / dur)) ** 2
        add(s0 + i, lp * vol * e * 1.6, pan)


def kick(start, vol=0.55):
    s0 = int(start * SR)
    n = int(0.28 * SR)
    for i in range(n):
        t = i / SR
        f = 130 * math.exp(-t * 22) + 42
        v = math.sin(2 * math.pi * f * t) * math.exp(-t * 11)
        add(s0 + i, v * vol, 0)


def shimmer(start, dur, vol=0.05):
    # airy high sparkle arpeggio wash
    notes = [1318.5, 1567.98, 1975.53, 2637.02]
    steps = int(dur / 0.24)
    for s in range(steps):
        f = notes[s % len(notes)] * (2 if s % 7 == 6 else 1)
        tone(f, start + s * 0.24, 0.5, vol * random.uniform(0.5, 1.0), pan=random.uniform(-0.5, 0.5), attack=0.005, decay=0.3, sustain=0.0, release=0.3)


# ---- chord progression: Am - F - C - G (vi-IV-I-V in C), 4s per chord ----
CHORDS = [
    [110.00, 164.81, 220.00, 261.63],   # Am
    [87.31, 174.61, 220.00, 261.63],    # F
    [98.00, 196.00, 246.94, 329.63],    # C/G color
    [98.00, 146.83, 196.00, 246.94],    # G
]
BASS = [55.00, 43.65, 65.41, 49.00]

for bar in range(45):  # 45 bars x 4s = 180s
    t0 = bar * 4.0
    ci = bar % 4
    chord = CHORDS[ci]
    # pad
    for f in chord:
        tone(f, t0, 4.4, 0.055, pan=random.uniform(-0.25, 0.25), wave_type="soft_saw", attack=0.9, decay=0.8, sustain=0.75, release=0.9)
        tone(f * 2, t0, 4.4, 0.018, pan=random.uniform(-0.3, 0.3), attack=1.1, decay=0.8, sustain=0.7, release=0.9)
    # sub bass pulse (8ths)
    for beat in range(8):
        tone(BASS[ci], t0 + beat * 0.5, 0.42, 0.16, wave_type="sine", attack=0.005, decay=0.18, sustain=0.35, release=0.12)
    # kick on quarters from bar 3 onward
    if bar >= 3:
        for beat in range(4):
            kick(t0 + beat * 1.0, 0.5 if bar < 40 else 0.58)
    # arp (16ths, sparse) from bar 2
    if bar >= 2:
        arp_notes = chord + [chord[2] * 2, chord[3] * 2]
        for s in range(16):
            if s % 2 == 0 or random.random() > 0.45:
                f = arp_notes[(s * 2 + bar) % len(arp_notes)] * 2
                tone(f, t0 + s * 0.25, 0.3, 0.045, pan=random.uniform(-0.45, 0.45), wave_type="tri", attack=0.004, decay=0.16, sustain=0.1, release=0.12)

# ---- scene-boundary risers / impacts (seconds) ----
BOUNDARIES = [12, 28, 44, 56, 66, 80, 94, 108, 120, 132, 146, 160, 172]
for b in BOUNDARIES:
    noise_hit(b - 1.1, 1.1, 0.16, sweep_down=False)   # riser into boundary
    kick(b, 0.7)                                       # impact
    tone(55.0, b, 1.4, 0.22, attack=0.004, decay=0.5, sustain=0.2, release=0.6)  # sub drop

# sparkle washes in features + finale
for start, dur in [(56, 10), (66, 14), (80, 14), (94, 14), (108, 12), (172, 7.5)]:
    shimmer(start, dur, 0.035)

# finale: lift — brighter arp octave + final chord swell
for s in range(28):
    f = [523.25, 659.25, 783.99, 1046.5][s % 4]
    tone(f, 172 + s * 0.25, 0.6, 0.05, pan=random.uniform(-0.4, 0.4), wave_type="tri", attack=0.005, decay=0.3, sustain=0.15, release=0.3)
for f in [220.0, 261.63, 329.63, 440.0]:
    tone(f, 176.5, 3.4, 0.07, wave_type="soft_saw", attack=0.7, decay=0.6, sustain=0.8, release=1.4)

# ---- master: soft clip + fades ----
fade_in = int(1.2 * SR)
fade_out = int(2.5 * SR)
out = bytearray()
for i in range(N):
    g = 1.0
    if i < fade_in:
        g = i / fade_in
    if i > N - fade_out:
        g = (N - i) / fade_out
    l = math.tanh(L[i] * 1.15) * g
    r = math.tanh(R[i] * 1.15) * g
    out += struct.pack("<hh", int(max(-1, min(1, l)) * 32767), int(max(-1, min(1, r)) * 32767))

os.makedirs(os.path.join(os.path.dirname(__file__), "..", "video", "public", "audio"), exist_ok=True)
path = os.path.join(os.path.dirname(__file__), "..", "video", "public", "audio", "score.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(out))
print(f"Wrote {path} ({os.path.getsize(path)/1e6:.1f} MB, {DUR:.0f}s)")
