import json
import time
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
        '''
        Returns complete available information.
        Returns:
            Dictionary.
        '''
        return self.fullinfo

    def get_people(self):
        '''
        Returns information about number of people in space.
        Returns:
            Dictionary object.
        '''
        return self.people

    def update_coordinates(self):
        print("update_coordinates")
        self.fullinfo.update(self.make_request(ISS_URL))

    def update_people(self):
        print("update_people")
        self.people.update(self.make_request(ASTROS_URL))

    def make_request(self, url):
        with urlrequest.urlopen(url) as response:
            if response:
                response = json.loads(str(response.read(), 'UTF-8'))
                return response
            else:
                app.logger.warning('Can\'t receive information from API.\n'
                        'URL is {}'.format(url))
                return None
