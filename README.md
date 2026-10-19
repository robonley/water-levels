# Water levels

Big-number display of well and cistern levels from PTDevices (PTLevel) sensors, for a phone or a wall-mounted tablet.

- Refreshes every 60 seconds; red below 25%, amber below 50%.
- No credentials in this repo. Each device stores its own PTDevices API token in its browser (localStorage).
- Data comes straight from `api.ptdevices.com` in the viewer's browser; nothing is stored anywhere else.

Settings (refresh interval, thresholds, display order) are at the top of the script in `index.html`.
