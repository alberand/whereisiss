from flask import Flask, render_template
from api import Source
import json
app = Flask(__name__)

src = Source()

@app.route("/")
def main():
    template = 'index.html'

    return render_template(template, data=src.get_iss_info())

@app.route("/coords")
def get_iss_info():
    src._update()
    data = src.get_iss_info()

    return json.dumps([data['latitude'], data['longitude']])

@app.route("/people")
def get_people_in_space():
    src._update()
    data = src.get_people()

    return json.dumps(data)

if __name__ == "__main__":
    app.run()
