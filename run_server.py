#!/usr/bin/env python
import os
import sys
import uvicorn

os.chdir(r'c:\projects\backend')
sys.path.insert(0, r'c:\projects\backend')

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
