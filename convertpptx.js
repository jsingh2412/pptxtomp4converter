const fs = require('fs-extra');
const path = require('path');
const {execSync} = require('child_process');
const pptxFile = process.argv[2];
if (!pptxFile || !pptxFile.endsWith('.pptx')) {
  console.error('Usage: node convertPptxToMp4.js file.pptx');
  process.exit(1);
}
const tempDir = path.join(__dirname, 'temp_slides');
const outputVideo = path.join(__dirname, 'output.mp4');
const sofficePath = '/opt/homebrew/Caskroom/libreoffice/25.2.3/soffice.wrapper.sh';
const secondsPerSlide = 5; // Change duration per slide here

async function convertToImages() {
  await fs.ensureDir(tempDir);
  console.log('Converting PPTX to images...');
  // convert pptx to pdf
  const pdfPath = path.join(tempDir, pptxFile.replace(/\.pptx$/, '.pdf'));
  execSync(`${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${pptxFile}"`);
  // convert pdf to pngs
  execSync(`magick -density 300 -quality 100 "${pdfPath}" "${tempDir}/slide_%03d.png"`);
  // delete pdf
  await fs.remove(pdfPath);
}

function sortAndRenameImages() {
  console.log('Sorting and renaming slide images...');
  const files = fs
    .readdirSync(tempDir)
    .filter((f) => f.endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

  files.forEach((file, index) => {
    const newName = `slide_${String(index).padStart(2, '0')}.png`;
    fs.renameSync(path.join(tempDir, file), path.join(tempDir, newName));
  });
}

function createVideoFromImages() {
  console.log('Generating MP4 from images...');
  execSync(
    `ffmpeg -y -framerate 1/${secondsPerSlide} -i ${path.join(
      tempDir,
      'slide_%02d.png',
    )} -c:v libx264 -r 30 -pix_fmt yuv420p ${outputVideo}`,
  );
  console.log('MP4 created at:', outputVideo);
}

(async () => {
  try {
    await convertToImages();
    sortAndRenameImages();
    createVideoFromImages();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await fs.remove(tempDir);
  }
})();
