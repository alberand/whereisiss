import os
from issmap import app

if __name__ == '__main__':
    app.run(host=os.environ['ISS_HOST'])
