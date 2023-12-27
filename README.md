<div align="center"> 
    <a href="https://github.com/ddgryaz/dotaStatsCLI">
        <img
            src="docs/logo.png"
            width="800"
            height="auto"
        />
    </a>
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
- [Quick start](#quick-start)
- [Install](#install)
- [Example](#example)
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

### Quick start

### Install

### Example

### Customization

In the release version of the application, stock images were used, which are freely
distributed and used without additional licensing.  

But you can customize the images on the home page and error page.
Simply replace the images in the `templates/images`
directory while maintaining the standard file name. We highly recommend taking
a look at the images from here - [Dota 2 Wallpapers](https://www.wallpaperflare.com/search?wallpaper=dota+2), 
they look great in your game records section!

### FAQ

### License

Licensed under [MIT](./LICENSE).