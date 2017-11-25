# [Trakt.tv]-Module for the [MagicMirror](https://github.com/MichMich/MagicMirror/)
_This is a WIP with basic functionality. If you'd like to contribute, pull requests are welcome!_


### Todo

- [ ] CSS
- [ ] Pictures for the shows
- [ ] More configuration options


### Creating a [Trakt.tv] API [application]

To get your API keys you need to first create an [application]. Give it a name, and enter `http://localhost/` in the callback field _(it's a required field but not used for our purpose)_.


## Installation

Clone the repository into your MagicMirror's modules folder, and install dependencies:

```sh
  cd ~/MagicMirror/modules
  git clone https://github.com/Kiina/MMM-trakt
  cd MMM-trakt
  npm install
```


## Using the Module

To run the module, you need to add the following data to your ` ~/MagicMirror/config/config.js` file:

```
{
    module: "MM-trakt", position: "top_left", header: "Trakt - Series",
        config: {
            client_id: "private_id",
            client_secret: "secret_id",
            days: 2,
            username: 'username',
            id_lista: "idlist",  //example: "2896375"
            type: "shows" 
        }
},
```

## Configuration

| Option            | Description
| ----------------- | -----------
| `id_lista`        | To get the id_list you need to go to[This Link](https://trakt.docs.apiary.io/#reference/users/lists/get-a-user's-custom-lists?console=1), using the username and client_id in the UI Parameters and Headers, and in the Response, search for the List "ids" and then "trakt" value.



[Trakt.tv]:(https://trakt.tv/)
[application]: (https://trakt.tv/oauth/applications/new)
