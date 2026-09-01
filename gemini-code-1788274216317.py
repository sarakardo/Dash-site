# Create the ZIP file
zip_filename = "/tmp/Dash-final-SEO-GEO-website.zip"

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, base_dir)
            zipf.write(file_path, arcname)

print(f"ZIP package created successfully at: {zip_filename}")