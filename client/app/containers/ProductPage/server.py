from flask import Flask, request, jsonify, send_file
from gradio_client import Client, file
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = Client("rlawjdghek/StableVITON")

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/process', methods=['POST'])
def process_images():
    try:
        person_img = request.files.get('person_img')
        garment_img_url = request.form.get('garment_img')  # Garment URL from React

        if not person_img or not garment_img_url:
            return jsonify({'error': 'Missing files'}), 400

        person_img_path = os.path.join(UPLOAD_FOLDER, person_img.filename)
        person_img.save(person_img_path)

        garment_img_path = os.path.join(UPLOAD_FOLDER, 'garment.png')
        os.system(f'curl -o {garment_img_path} {garment_img_url}')

        # Call StableVITON API
        result = client.predict(
            vton_img=file(person_img_path),
            garm_img=file(garment_img_path),
            n_steps=10,
            is_custom=False,
            api_name="/process_hd"
        )

        # Return full path to frontend (without moving)
        return jsonify({'result_path': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/serve/<path:filepath>')
def serve_file(filepath):
    try:
        # Serve the file from its exact location
        return send_file(filepath)
    except Exception as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 404


if __name__ == '__main__':
    app.run(port=5000)
