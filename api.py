import json
# Fix for Python 2
try:
        import urllib.request as urlrequest
except ImportError:
        import urllib as urlrequest

from flask import Flask

app = Flask(__name__)

class Source:

    def __init__(self):
        # Satelitte NORAD id. For now (09.09.2016) API providing information 
        # only about ISS.
        self.sat_id = 25544

        self.data_set = dict()

        # Get data from API
        self._update()

    def get_iss_info(self):
        '''
        Returns complete available information.
        Returns:
            Dictionary.
        '''
        return self.data_set

    def get_iss_coords(self):
        '''
        Returns satellite coordinates.
        Returns:
            List in format [latitude, longitude]
        '''
        return [self.data_set['latitude'], self.data_set['longitude']]

    def get_iss_speed(self):
        '''
        Returns satellite speed.
        Returns:
            Float number in km/h.
        '''
        pass

    def get_people(self):
        '''
        Returns information about number of people in space.
        Returns:
            Dictionary object.
        '''
        return self.data_set['people']

    def _update(self):
        '''
        Update internal data structure.
        '''
        urls = [
            'https://api.wheretheiss.at/v1/satellites/{}'.format(self.sat_id),
            'http://api.open-notify.org/astros.json'
        ]

        for url in urls:
            response = self.make_request(url)
            if response:
                self.data_set.update(response)

    def make_request(self, url):
        response = urlrequest.urlopen(url)

        if response:
            response = json.loads(str(response.read()))
            return response
        else:
            app.logger.warning('Can\'t receive information from API.\n'
                    'URL is {}'.format(url))
            return None
