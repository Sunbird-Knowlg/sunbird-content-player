# Content-Player-Interface

Which provides an interface to [sunbird-content-player](https://www.npmjs.com/package/@project-sunbird/content-player)

## Setup

Download content-player-interface as NPM

> Run npm i @project-sunbird/content-player-interface
	
## Methods


```PI.getConfig()``` : Which return the content-player configurations.

```PI.EkstepRendererAPI```: Which return the content-player API methods.

```PI.getcontentMetadata(contentId, cb)```: Which return the metadata of the content.

```PI.exit()```:  Which is used to exit the player (Useful in mobile, While playing contents in mobile if user wants to exit the player from mobile).

```PI.getTelemetryService```: Which returns the telemetry instance object, To generate an telemetry events.

```PI.isMobile```: Which return the Boolean, Which say's whether content/game is playing in mobile or web environment.

```PI.gotoEndPage``` Which shows the content endpage. 

