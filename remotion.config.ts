import { Config } from '@remotion/cli/config'

// Renders the intro as a stand-alone video (npm run render:intro).
Config.setVideoImageFormat('jpeg')
Config.setCodec('h264')
Config.setCrf(16)
