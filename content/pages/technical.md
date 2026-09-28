---
title: Technical Work
nav: technical
description: Machine learning and data engineering at Russell Research, and a music practice tool, by Alex De Biasio.
---

# Technical Work

I started programming on [Scratch](https://scratch.mit.edu/users/ad1406/projects/) when I was eight.^[2014–2018.] These days most of my programming involves data: at Russell Research, and in a tool for practicing music that I keep coming back to.

## Russell Research<span class="marginnote">Summer 2024, Summer 2025<br>East Rutherford, NJ</span>

Russell Research is a market research firm, and I've spent two summers there. In 2024, as a machine learning intern, I trained models from scratch in Python and PyTorch to identify characteristics of survey questions. I compared convolutional and recurrent networks and explored graph-based approaches. Part of the job was investigating duplicate survey questions, so that near-copies of the same question couldn't end up in both the training and validation data. At handoff, I explained the models' results and their limitations.

In 2025 I switched to data engineering, contributing to a C#/.NET pipeline that standardizes market research surveys across XML, JSON, and Word documents.

## Music practice tool

This started when a friend was learning the first movement of Prokofiev's Third Piano Concerto and asked me for feedback. I made a small tool that lined up their playing with recordings by professional pianists and let me move through the audio in fine steps, so I could attach a note to any moment.

Separately, making [score videos](/music/#writing-and-score-videos) had me thinking about syncing audio to a score. I was inspired by a platform for making score videos that tries to find where each measure begins automatically. Putting the two ideas together, the tool now shows the score: click on a bar and it plays from there, and you can switch between pianists' recordings without losing your place.^[So far I've set it up with Bach's French Overture and Schubert's Sonata in C Minor, D. 958, which I'm learning now.] Next I want it to work well with my own recordings as input, and I'm still figuring out the best way to do that.

It's a long-term project, and it keeps changing as my idea of it does. Much of the code was written with Claude, and it's still rough in places: there are bugs, and the workflow isn't always smooth. I don't yet fully understand how the audio alignment works, which is part of why I'm taking a tutorial on harmonic analysis this semester.
