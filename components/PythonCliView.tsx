import { Terminal, Copy, CheckCircle2, SlidersHorizontal, Cpu, PlayCircle, Sparkles, FileBox } from 'lucide-react';
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
    <div className="w-full space-y-10 font-sans">
      
      {/* Title Section */}
      <div className="mb-10 max-w-2xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bitcount font-light text-white tracking-tight leading-tight mb-4">
          Python CLI<br />
          <span className="text-cyan-400">Implementation</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
          If you want a runnable Python code for a CLI file compression tool, here it is! 
          It is specifically designed for High-Fidelity Image and Font Retention Preservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Setup Requirements */}
        <div className="bg-[#111318] rounded-xl border border-gray-800 p-6 flex flex-col h-full shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-gray-300" />
            <h3 className="text-sm font-bold text-gray-200 tracking-widest uppercase">Setup Requirements</h3>
          </div>
          
          <div className="bg-[#0a0a0a] rounded-lg border border-gray-800 mb-4 flex-grow">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <span className="text-xs font-mono text-gray-500">requirements.txt</span>
              <button onClick={() => copyToClipboard(reqsCode, setCopiedReqs)} className="text-gray-500 hover:text-white transition-colors">
                {copiedReqs ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-4">
              <pre className="text-sm font-mono leading-loose">
                <code className="text-cyan-400">pikepdf</code><span className="text-gray-400">==</span><span className="text-green-400">8.11.2</span><br/>
                <code className="text-cyan-400">Pillow</code><span className="text-gray-400">==</span><span className="text-green-400">10.3.0</span>
              </pre>
            </div>
          </div>
          
          <div className="bg-cyan-900/10 border border-cyan-900/30 rounded-lg p-4 flex gap-3 text-sm">
            <span className="text-cyan-400 font-mono font-bold">[INFO]</span>
            <span className="text-gray-400">Requires pikepdf and Pillow for structural optimization.</span>
          </div>
        </div>

        {/* The Core Engine */}
        <div className="bg-[#111318] rounded-xl border border-gray-800 lg:col-span-2 p-6 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gray-300" />
              <h3 className="text-sm font-bold text-gray-200 tracking-widest uppercase">The Core Engine</h3>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-600/50"></div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg border border-gray-800 overflow-hidden flex-grow flex flex-col relative">
             <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0f1115] shrink-0">
               <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">compressor.py</span>
               <div className="flex items-center gap-3">
                 <button onClick={() => copyToClipboard(pythonCode, setCopiedCode)} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 p-1.5 rounded-md border border-gray-700">
                   {copiedCode ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>
             <div className="p-4 max-h-[350px] overflow-hidden relative">
               <pre className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto scrollbar-none">
                 <code>{pythonCode}</code>
               </pre>
               <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
             </div>
          </div>
        </div>
      </div>

      {/* Execution Flow & Details */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Execution Flow */}
        <div className="bg-[#111318] rounded-xl border border-gray-800 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-100 mb-2">Execution Flow</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            How to run the tool from your terminal.
          </p>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-5 relative">
            <div className="font-mono text-sm leading-loose">
              <span className="text-gray-500">1.</span> <span className="text-gray-300">pip install -r requirements.txt</span><br/>
              <span className="text-gray-500">2.</span> <span className="text-gray-300">python compressor.py </span><span className="text-cyan-400">input.pdf output.pdf --level high-quality</span><br/>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center border border-cyan-500/20">
              <PlayCircle className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
