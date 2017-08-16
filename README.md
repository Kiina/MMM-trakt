# Trakt.tv-Module for the MagicMirror
### This Project is WIP and currently very basic, if someone wants to help out, contact me or open a pull request

[MagicMirror Project on Github](https://github.com/MichMich/MagicMirror/)

## Usage

You need to install the module for your MagicMirror.

### Installation

Navigate into your MagicMirror's modules folder:

```shell
cd ~/MagicMirror/modules
```
Clone this repository:
```shell
git clone https://github.com/Kiina/MM-trakt
```
Configure the module in your config.js file.


### Creating a trakt application

To get your API keys you need to first create an application [here](https://trakt.tv/oauth/applications/new).


### Configuration

To run the module, you need to add the following data to your config.js file.

```
{
	module: 'MM-trakt',
	position: 'top_center', // you may choose any location
	config: {
		client_id: 'YOUR_CLIENT_ID',
		client_secret: 'YOUR_CLIENT_SECRET',
		days: 1 //optional with a default of 1
	}
}
```

### Todo

* Save OAuth
* Better Design
* Pictures for the shows
* More configuration options
* Better code
