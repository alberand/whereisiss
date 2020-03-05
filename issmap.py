import os
from flask import Flask, render_template
from api import Source
import json
from threading import Timer
app = Flask(__name__)

src = Source()

t1 = RepeatTimer(3.0, src.update_coordinates)
t1.start()
t2 = RepeatTimer(86400.0, src.update_people)
t2.start()

@app.route("/")
def main():
    template = 'index.html'
    return render_template(template, data=src.get_iss_info())

@app.route("/issfullinfo")
def get_iss_full_info():
    data = src.get_iss_info()
    return json.dumps(data)

@app.route("/people")
def get_people_in_space():
    data = src.get_people()
    return json.dumps(data)


class RepeatTimer(Timer):
    def run(self):
        while not self.finished.wait(self.interval):
            self.function(*self.args, **self.kwargs)

if __name__ == "__main__":
    app.run(host=os.environ['ISSMAP_DEMO_HOST'])
