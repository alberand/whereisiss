import json
import time
import sys
# Fix for Python 2
try:
        import urllib.request as urlrequest
except ImportError:
        import urllib as urlrequest

from flask import Flask

app = Flask(__name__)

ASTROS_URL = 'http://api.open-notify.org/astros.json'
# Satelitte NORAD id. For now (09.09.2016) API providing information 
# only about ISS.
# 25544 is for ISS
ISS_URL = 'https://api.wheretheiss.at/v1/satellites/25544'

class Source:
    '''
    Assumption:
        - Coordinates are requiested at least once a day
    '''

    def __init__(self):
        self.people = dict()
        self.people.update(self.make_request(ASTROS_URL))
        self.fullinfo = dict()
        self.fullinfo.update(self.make_request(ISS_URL))

    def get_iss_info(self):
        return self.fullinfo

    def get_people(self):
        return self.people

    def update_coordinates(self):
        self.fullinfo.update(self.make_request(ISS_URL))
        print(self.fullinfo)

    def update_people(self):
        self.people.update(self.make_request(ASTROS_URL))
        print(self.people)

    def make_request(self, url):
        with urlrequest.urlopen(url) as response:
            if response:
                response = json.loads(str(response.read(), 'UTF-8'))
                return response
            else:
                app.logger.warning('Can\'t receive information from API.\n'
                        'URL is {}'.format(url))
                sys.exit(1)
                return None
