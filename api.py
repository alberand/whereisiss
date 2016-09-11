import json
import urllib.request
from flask import Flask

app = Flask(__name__)

class Source:

    def __init__(self):
        # Satelitte NORAD id. For now (09.09.2016) API providing information 
        # only about ISS.
        self.sat_id = 25544

        self.data_set = None

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

    def _update(self):
        '''
        Update internal data structure.
        '''
        url = 'https://api.wheretheiss.at/v1/satellites/{}'
        response = urllib.request.urlopen(url.format(self.sat_id))

        if response:
            self.data_set = json.loads(str(response.read(), 'utf-8'))
        else:
            app.logger.warning('Can\'t receive information from API.')


