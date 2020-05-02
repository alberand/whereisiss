import os
from flask import Flask, render_template
from api import Source
import json
from threading import Timer
app = Flask(__name__)

src = Source()

class RepeatTimer(Timer):
    def run(self):
        while not self.finished.wait(self.interval):
            self.function(*self.args, **self.kwargs)

t1 = RepeatTimer(3.0, src.update_coordinates)
t1.start()
t2 = RepeatTimer(86400.0, src.update_people)
t2.start()

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
