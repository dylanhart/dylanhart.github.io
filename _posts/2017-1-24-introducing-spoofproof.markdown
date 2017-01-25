---
layout: post
author: Dylan Hart
date: 2017-1-24
title: "Introducing SpoofProof.net"
subtitle: "A project for the SBHacksIII Hackathon"
categories: spoofproof sbhacks
---

Last weekend I went to [SBHacksIII][0] (a MLH hackathon at UCSB) with a few friends.
At the hackathon we made [SpoofProof][1], a web application to automatically detect fake news.

*A full writeup of SpoofProof is available on [devpost][2].*

![spoofproof homepage](https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/463/913/datas/gallery.jpg)

[0]: http://www.sbhacks.com
[1]: http://spoofproof.net
[2]: https://devpost.com/software/spoofproof

### What I worked on

In order to maximize our development efforts we broke the project down into several core modules: web scraping, credibility analysis, and web interface.
I worked on developing the web interface for SpoofProof and configured the web server.

Before we started hacking, we determined we would use python as our programming language due to its fantastic library support.
This was perfect for me as I could use [Django][3] as my framework and directly call into our analysis code.
Using Django, I was able to quickly create an app with 2 pages (index and results) and a REST endpoint for submitting urls.
Then, using Twitter Bootstrap and JQuery, it was simple to slap together an interface which I prettied up later with some CSS.

Next came the task of getting the server online.
We took advantage of some swag we got to register the domain and set up a small DigitalOcean VPS.
I set up Nginx as a proxy server that serves the static files and proxies traffic to the Django application running under gunicorn.
This is mostly good but there are a couple small issues I didn't work out.
First, the gunicorn daemon isn't running as a service; if the server ever goes down someone will have to manually start it again.
Second, I should really set up another user to run gunicorn so that it isn't running as root.

[3]: https://www.djangoproject.com/

### The Takeaway

This was a really fun project to work on, and it was cool to see what we could acomplish in 36 hours.

The source for SpoofProof.net is available [on github][4].

[4]: https://github.com/dylanhart/sbhacks 
