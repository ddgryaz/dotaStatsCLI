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
[![npm](https://img.shields.io/npm/dt/dotastatscli)](https://www.npmjs.com/package/dotastatscli)
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

> Starting with version 2.0.0 dotaStatsCLI switched to ESM.
> And also received changes in user interaction. README updated.

### Table of Contents

- [Advantages and differences](#advantages-and-differences)
- [How it works?](#how-it-works)
- [Quick start and install](#quick-start-and-install)
- [Customization](#customization)
- [FAQ](#FAQ)
- [Changelog](#Changelog)
- [License](#license)

### Advantages and differences

DotaStatsCLI allows you to see full statistics (including games in Turbo and other major game mods). 
For example: You have played 500 games on Tinker, 450 of which were played in Turbo mode. 
Other stats providers, as well as Dota itself, will claim that you only played Tinker in 50 games.  

DotaStatsCLI in this example will show your 500 games on Tinker.

### How it works?

After launching the application, you will be given a choice.  
Find a player and collect statistics on him or select a player from previously saved ones.
(If there are no saved players, the corresponding item will be disabled).  

Next, you will need to enter the number of matches you want to analyze and select a game data provider.  

Choose an openDota provider (recommended) if you want to get statistics for a large number of
games or for your entire gaming career (50-10000+ matches).  

Choose dotaBuff provider if you want to get fast visualization for a small number of 
games (50-500 matches).  

In the first case, the data will be collected from the provider using query API calls.
In the second case, a web scraper will be launched,
which will collect information by interacting with html markup.  

After collecting the data and all the necessary calculations, 
an HTML page will be generated, which will open in your default browser.

### Quick start and install

The easiest and best way to install DotaStatsCLI - is to use [NPM](https://docs.npmjs.com/about-npm).

> **DotaStatsCLI is not a library! Is a standalone CLI application, please install globally!**

```sh
npm install -g dotastatscli
```

If you already have an older version installed, run:

```sh
npm update -g dotastatscli
```

The first time you analyze a player, you will be asked to save it to a configuration file. 
You can save players for quick access to their statistics.  

Saved players are stored in a configuration file. 
Its location is displayed on the screen every time the program is launched. 
Some other settings are also stored here, such as the port for the application 
or the number of rows in the statistics tables.  

An example of a correctly completed ```config.json```:

```json
{
  "players": [
    {
      "playerName": "YATORO",
      "id": 321580662
    },
    {
      "playerName": "COLLAPSE",
      "id": 302214028
    },
    {
      "playerName": "MIRA",
      "id": 256156323
    },
    {
      "playerName": "TORONTOTOKYO",
      "id": 431770905
    }
  ],
  "port": 6781,
  "rows": 10
}
```


### Customization

In the release version of the application, stock images were used, which are freely
distributed and used without additional licensing.  

But you can customize the images on the home page and error page.
Simply replace the images in the `templates/images`
directory while maintaining the standard file name.

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

> The number of rows in statistics tables is configured in the configuration file (config.json). 
> The default value is 10.

* By what principle are the statistics tables sorted?

> The data is sorted by the number of games played (column - "Total Games"), 
> the second criterion for sorting is the percentage of wins (column - "WinRate %"), 
> the third sorting criterion is alphabet.

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

### Changelog

You can check out the changelog here - [CHANGELOG](https://github.com/ddgryaz/dotaStatsCLI/blob/master/CHANGELOG.md).

### License

Licensed under [MIT](./LICENSE).