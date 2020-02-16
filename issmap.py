import os
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
def get_iss_coords():
    data = src.get_iss_coords()
    return json.dumps(data)

@app.route("/issfullinfo")
def get_iss_full_info():
    data = src.get_iss_info()
    return json.dumps(data)

@app.route("/people")
def get_people_in_space():
    data = src.get_people()
    return json.dumps(data)

if __name__ == "__main__":
    app.run(host=os.environ['ISSMAP_DEMO_HOST'])
