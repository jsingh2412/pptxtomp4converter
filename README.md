# Convert PPTX to MP4

Take any pptx file and convert it into a mp4 file with, each slide is a static number of seconds determined on line 12.

# Local Setup

This assumes you have Node setup along with brew available to install dependencies of script.

brew install ffmpeg libreoffice ghostscript imagemagick

npm install unzipper fs-extra child_process

node convertpptx.js {pptxfile}
