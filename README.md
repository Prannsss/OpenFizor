<div align="center">

# OpenFizor

**A high-performance Python CLI and Next.js Web Tool for multi-format document compression.**

</div>

## Overview

OpenFizor is designed to drastically compress large PDF and Microsoft Office documents (DOCX, PPTX) without compromising structural integrity, embedded fonts, or crucial image fidelity. It accomplishes this through structural PDF streamlining and advanced media quantization within ZIP archives.

It offers two interfaces:
- **Python CLI Tool** (`compressor.py`): Run locally using Python for automated, high-level batch compression with zero data transfer to third parties.
- **Web Interface**: A client-side browser tool built on Next.js, allowing drag-and-drop compression straight from the browser securely.

## Features
- **PDF Structural Optimization**: Uses `pdf-lib` and `pikepdf` to repackage document streams efficiently.
- **Office Document Compression**: Re-wraps DOCX/PPTX architectures with ZIP_DEFLATE level 9 padding.
- **Image Quantization**: Strips down high-res inline JPEGs, PNGs, and GIFs using palette reduction algorithms to dramatically decrease overall file sizes.
- **100% Secure**: All processing takes place locally via Python or securely inside the browser via JavaScript. No uploads to external servers.

## Run Locally (Web Tool)

**Prerequisites:**  Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to interact with the Next.js web application.

## Run Locally (Python CLI)

**Prerequisites:** Python 3.8+

1. Install Python dependencies:
   ```bash
   pip install pikepdf Pillow
   ```
2. Run the compression script:
   ```bash
   python compressor.py input.pdf output.pdf --level high-quality
   ```
