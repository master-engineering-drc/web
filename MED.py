from flask import Flask, request, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # Assure-toi que le fichier est dans /templates

@app.route('/send', methods=['POST'])
def send():
    name = request.form['name']
    email = request.form['email']
    message = request.form['message']
    print(f"Message reçu de {name} ({email}) : {message}")
    return "Message envoyé avec succès !"

if __name__ == '__main__':
    app.run(debug=True)
