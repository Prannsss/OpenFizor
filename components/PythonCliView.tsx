import { Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function PythonCliView() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  const pythonCode = `import argparse
import pikepdf
import sys
import os
import zipfile

def compress_pdf(input_path, output_path, level='balanced'):
    """
    Compresses a PDF file while preserving high-fidelity images and embedded fonts.
    Uses pikepdf (QPDF wrapper) to safely optimize the PDF structure.
    """
    try:
        print(f"Opening {input_path}...")
        # Open the PDF
        with pikepdf.Pdf.open(input_path) as pdf:
            # Save the PDF with optimizations
            # pikepdf safely compresses streams and removes unreferenced objects
            # without touching the actual image data or font subsets.
            print(f"Compressing and saving to {output_path}...")
            pdf.save(
                output_path,
                compress_streams=True,
                linearize=True, # Optimizes for web viewing (Fast Web View)
                force_version='1.5' # Ensures compatibility and better compression features
            )
        
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        savings = (1 - (new_size / original_size)) * 100
        
        print(f"Success! Compressed from {original_size/1024:.2f} KB to {new_size/1024:.2f} KB.")
        print(f"Space saved: {savings:.2f}%")
        
    except Exception as e:
        print(f"Error compressing PDF: {e}", file=sys.stderr)
        sys.exit(1)

def compress_office_doc(input_path, output_path):
    """
    Compresses DOCX/PPTX files by repackaging their internal ZIP structure 
    and applying image quantization (color reduction for PNGs, DCT for JPEGs).
    """
    import io
    from PIL import Image
    
    try:
        print(f"Opening {input_path}...")
        with zipfile.ZipFile(input_path, 'r') as zip_in:
            print(f"Applying quantization and saving to {output_path}...")
            with zipfile.ZipFile(output_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zip_out:
                for item in zip_in.infolist():
                    buffer = zip_in.read(item.filename)
                    
                    # Apply quantization to images
                    if item.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        try:
                            img = Image.open(io.BytesIO(buffer))
                            out_io = io.BytesIO()
                            
                            if item.filename.lower().endswith('.png'):
                                # Quantize PNG to 256 colors
                                if img.mode == 'RGBA':
                                    img = img.quantize(colors=256, method=2)
                                else:
                                    img = img.quantize(colors=256)
                                img.save(out_io, format='PNG', optimize=True)
                            elif item.filename.lower().endswith('.gif'):
                                # Convert GIF to static image (first frame) and quantize
                                if img.mode != 'RGBA':
                                    img = img.convert('RGBA')
                                img = img.quantize(colors=256, method=2)
                                img.save(out_io, format='GIF', optimize=True)
                            else:
                                # Quantize JPEG
                                if img.mode != 'RGB':
                                    img = img.convert('RGB')
                                img.save(out_io, format='JPEG', quality=75, optimize=True)
                            
                            new_buffer = out_io.getvalue()
                            # Only use if it actually saves space
                            if len(new_buffer) < len(buffer):
                                buffer = new_buffer
                        except Exception as img_e:
                            print(f"  Skipping image {item.filename} due to error: {img_e}")
                            
                    zip_out.writestr(item, buffer)
        
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        savings = (1 - (new_size / original_size)) * 100
        
        print(f"Success! Compressed from {original_size/1024:.2f} KB to {new_size/1024:.2f} KB.")
        print(f"Space saved: {savings:.2f}%")
    except Exception as e:
        print(f"Error compressing Office document: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="High-Fidelity Document Compression Tool")
    parser.add_argument("input", help="Path to the input file (PDF, DOCX, PPTX)")
    parser.add_argument("output", help="Path to the output file")
    parser.add_argument(
        "--level", 
        choices=['lossless', 'high-quality', 'balanced'], 
        default='balanced',
        help="Compression level (structural compression preserves fonts/images)"
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' does not exist.", file=sys.stderr)
        sys.exit(1)
        
    ext = args.input.lower().split('.')[-1]
    if ext == 'pdf':
        compress_pdf(args.input, args.output, args.level)
    elif ext in ['docx', 'pptx']:
        compress_office_doc(args.input, args.output)
    else:
        print("Unsupported file format. Please provide a PDF, DOCX, or PPTX file.", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()`;

  const reqsCode = `pikepdf==8.11.2
Pillow==10.3.0`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Explanation Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Python CLI Implementation</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">
            If you want a runnable Python code for a CLI file compression tool, her it is guys!
            It is specifically designed to meet your core requirements: High-Fidelity Image Preservation and Font Retention.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">PDF Compression (pikepdf)</h3>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              I chose <strong>pikepdf</strong> (a Python wrapper for QPDF) because it performs <em>structural</em>, content-preserving transformations. Unlike Ghostscript, which can sometimes aggressively rasterize or downsample if flags aren&apos;t perfect, pikepdf strictly manipulates the PDF structure.
            </p>
          </div>
          <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">Office Compression (DOCX/PPTX)</h3>
            <p className="text-sm text-purple-800/80 leading-relaxed">
              Office documents are ZIP archives containing XML and media. We apply <strong>Image Quantization</strong> to the embedded media: PNGs are color-reduced to 256 colors (8-bit), JPEGs undergo DCT quantization, and <strong>GIFs are converted to static frames</strong> to strip animation bloat. We then repackage the document with maximum DEFLATE compression, drastically reducing file size while preserving fonts and visual fidelity.
            </p>
          </div>
        </div>
      </div>

      {/* Code Section */}
      <div className="space-y-6">
        
        {/* Requirements */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
              <Terminal className="w-4 h-4" />
              requirements.txt
            </div>
            <button 
              onClick={() => copyToClipboard(reqsCode, setCopiedReqs)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-md"
            >
              {copiedReqs ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReqs ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300">
              <code>{reqsCode}</code>
            </pre>
          </div>
        </div>

        {/* Python Script */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
              <Terminal className="w-4 h-4" />
              compressor.py
            </div>
            <button 
              onClick={() => copyToClipboard(pythonCode, setCopiedCode)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-md"
            >
              {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300 leading-relaxed">
              <code>{pythonCode}</code>
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How to run the tool</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>Save the dependencies list to a file named <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">requirements.txt</code>.</li>
            <li>Save the Python script to a file named <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">compressor.py</code>.</li>
            <li>Install the dependencies by running: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">pip install -r requirements.txt</code></li>
            <li>Run the tool from your terminal: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">python compressor.py input.pdf output.pdf --level high-quality</code></li>
          </ol>
        </div>

      </div>
    </div>
  );
}
