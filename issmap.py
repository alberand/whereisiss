import json
import os

from uwsgidecorators import *
from flask import Flask, render_template

from api import Source

app = Flask(__name__)

src = Source()

@timer(3)
def update_coordinates(num):
    src.update_coordinates()

@timer(10800)
def update_people(num):
    src.update_people()

@app.route("/")
def main():
    return render_template('index.html', data=src.get_iss_info())

@app.route("/issfullinfo")
def get_iss_full_info():
    return json.dumps(src.get_iss_info())

@app.route("/people")
def get_people_in_space():
    return json.dumps(src.get_people())

if __name__ == "__main__":
    app.run(host=os.environ['ISSMAP_DEMO_HOST'])
