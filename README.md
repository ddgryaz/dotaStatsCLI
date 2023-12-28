<div align="center"> 
    <a href="https://github.com/ddgryaz/dotaStatsCLI">
        <img
            src="docs/logo.png"
            width="800"
            height="auto"
        />
    </a>
</div>

<div align="center">

[![npm-version](https://img.shields.io/npm/v/dotastatscli?color=%2335b18e)](https://www.npmjs.com/package/dotastatscli)
[![license](https://img.shields.io/npm/l/dotastatscli?color=blue)](https://github.com/ddgryaz/dotaStatsCLI?#LICENSE)

</div>

<br />

Do popular gaming stats providers limit your high scores and stats to game modes?
Are you satisfied with receiving information exclusively for your entire gaming career?
Are you ready to use paid features from providers to get what you need in an
overloaded interface?  

DotaStatsCLI - Simple, free and effective CLI application that allows you to receive
statistics of your matches in dota and visualize it in a pleasant and understandable way.
You choose how many matches you want to receive information for.
We visualize this information and provide your gaming records, top rankings and
general information.

### Table of Contents

- [How it works?](#how-it-works)
- [Quick start and install](#quick-start-and-install)
- [Customization](#customization)
- [FAQ](#FAQ)
- [License](#license)

### How it works?

The application takes two arguments. The first is the player ID, the second is 
the number of games that need to be analyzed.  

Next, the application will ask you to select a game data provider.
There are two data providers available in version 1.0.0.  

Choose dotaBuff provider if you want to get fast visualization for a small number of 
games (50-500 matches).  

Choose an openDota provider if you want to get statistics for a large number of 
games or for your entire gaming career (50-10000+ matches).  

In the first case, a web scraper will be launched, 
which will collect information by interacting with html markup.
In the second case, the data will be collected from the provider using query API calls.  

After collecting the data and all the necessary calculations, 
an HTML page will be generated, which will open in your default browser.

### Quick start and install

The easiest and best way to install DotaStatsCLI - is to use [NPM](https://docs.npmjs.com/about-npm).

> **DotaStatsCLI is not a library! Is a standalone CLI application, please install globally!**

```sh
npm install -g dotastatscli
```

Use the app with two required arguments, PLAYER_ID and GAMES_COUNT, like this:

```sh
dotastatscli 321580662 500
```

This ID belongs to a professional Dota player. 
After all the calculations have been made, the visualization will open in your browser.  



### Customization

In the release version of the application, stock images were used, which are freely
distributed and used without additional licensing.  

But you can customize the images on the home page and error page.
Simply replace the images in the `templates/images`
directory while maintaining the standard file name. We highly recommend taking
a look at the images from here - [Dota 2 Wallpapers](https://www.wallpaperflare.com/search?wallpaper=dota+2), 
they look great in your game records section!

### FAQ

* How can I find out my PLAYER ID?

> At the moment, we do not know of any convenient ways to obtain a PLAYER ID. 
> You can find it out by searching on popular data aggregator sites 
> (which we use as data providers) - www.dotabuff.com or www.opendota.com. 
> When you find a player by nickname or game and go to his profile, 
> the address bar will have the following address: “PROVIDER.com/players/XXX/”, 
> where XXX is the PLAYER ID.

* Why is the data from different providers different, despite the same number of game matches?  

> Indeed, the data may vary, usually it is a small difference. 
> This is because providers define certain game outcomes differently, 
> such as games that did not start because one of the players 
> failed to load or where one of the players left the game.

* What determines the number of heroes or items in statistics tables?

> The number of rows in statistics tables is a dynamic variable. 
> If you requested 200+ game matches for analysis, 
> then there will be 10 lines, otherwise 5.

* By what principle are the statistics tables sorted?

> The data is sorted by the number of games played (column - "Total Games"), 
> the second criterion for sorting is the percentage of wins (column - "WinRate %").

* For some items in the rating, instead of a name and image, “no data” is written. Is this a bug?  

> If you are using the openDota supplier, then this is a normal situation
> that will soon be corrected on the supplier's side. 
> This is usually due to a delay in updating data for new items or heroes.

* How is animation implemented on the statistics page?

> The animation is implemented using a small 
> and wonderful open source library - [AOS - Animate on scroll library](https://github.com/michalsnik/aos).

* Can I participate in the development of the project?

> Yes! DotaStatsCLI is an open source application. 
> The application was born as a hobby. If you want to help in development, 
> fix bugs or make any contribution, we will be happy to wait for PR.

* Where can I report a bug in the application?

> You can report a bug or ask a question related to the application
> on the GitHub page in a special tab - [DotaStatsCLI-issues](https://github.com/ddgryaz/dotaStatsCLI/issues).

### License

Licensed under [MIT](./LICENSE).