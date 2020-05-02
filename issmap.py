import json
import os

from flask_apscheduler import APScheduler
from flask import Flask, render_template

from api import Source

app = Flask(__name__)

src = Source()

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
    scheduler = APScheduler()
    scheduler.add_job(func=src.update_coordinates, args=[], trigger='interval',
                id='coordinates', seconds=3)
    scheduler.add_job(func=src.update_people, args=[], trigger='interval',
                id='people', hours=3)
    scheduler.start()
    app.run(host=os.environ['ISSMAP_DEMO_HOST'])
