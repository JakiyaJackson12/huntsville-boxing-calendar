# Gym Kiosk Deployment Checklist

## Hardware
- Windows 10/11 Pro mini PC or compatible existing PC
- HDMI connection into the gym's existing Extron video path
- USB connection into the existing Intelix/StarBoard touch path
- Wired Ethernet preferred; reliable Wi-Fi is acceptable

## Windows
- Create a local standard kiosk account
- Install current Microsoft Edge
- Disable sleep while plugged in
- Keep display-off behavior separate from PC sleep
- Install any StarBoard/touch drivers required by the actual board model

## Kiosk
- Settings -> Accounts -> Other users -> Set up a kiosk
- Choose Microsoft Edge
- Digital sign / interactive display
- Use the production dashboard URL
- Reboot and verify auto-launch

## Acceptance test
- Reboot PC -> dashboard opens without manual clicks
- Turn projector/display off -> PC continues running
- Turn projector/display on -> dashboard is already present
- Touch Week / Day / Month -> buttons respond correctly
- Change a Google Calendar event -> board reflects it after refresh
- Unplug network briefly -> cached schedule remains on screen
- Restore network -> sync state returns to live
