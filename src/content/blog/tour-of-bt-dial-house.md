---
title: Tour of BT Dial House
date: 2021-02-06
excerpt: >-
  Back in 2019 I toured a large BT telephone exchange in Manchester. I
  tweeted about it, but thought it'd be nice to preserve the photos and
  narrative here in a blog post.
cover: /content/images/2023/06/lars-kienle-IlxX7xnbRF8-unsplash.webp
---

Back in 2019 I toured a large BT telephone exchange in Manchester.

I [tweeted](https://twitter.com/rossalexwilson/status/1126211375137808385) about it, but thought it'd be nice to preserve the photos and narrative here in a blog post. The following words are shamelessly copied from my Twitter thread, enjoy 🤓

So I've spent this evening touring BT Dial House in Manchester. It's a huge telephone exchange, and brings telephony and Internet access to Manchester. Wanna see some photos and nerd out with me?

This is just one of the marine diesel generators that live in the lowest basement. The site has its own dual redundant HV feed, and operate their own HV/LV transformer kit. They take ~600 litres of oil, and are regularly tested.

![One of the marine diesel generators in the basement.](/content/images/2021/02/D6EbSDvW0AArhvh.webp)

To power those, they need a load of fuel. There's a tank like this for each generator, and they hold enough red diesel for 8 hours. An additional huge set of tanks sit behind which receive fuel deliveries from a tanker connection outside the building.

![One of the red-diesel fuel tanks that feed a generator.](/content/images/2021/02/D6EbSrVWwAAsOMs.webp)

This is where the copper telephone cables and fibre enter the site, from street level. There's a mix of 1000-pair cables that are pressurised with air to keep out moisture, and fibre cables. They once had a cable tunnel fire and only detected it when fire emerged from the tunnel.

![Copper and fibre cables entering the building from street level.](/content/images/2021/02/D6EbTOeW0AExBh--1.webp)

![Another view of the cable entry chamber.](/content/images/2021/02/D6EbTPAW0AAO6ed-1.webp)

![Another view of the cable entry chamber.](/content/images/2021/02/D6EbTP5WkAAz7FN-1.webp)

![Another view of the cable entry chamber.](/content/images/2021/02/D6EbTQjXkAEJ_j4-1.webp)

Up a floor. Now those copper cable pairs enter the MDF, a huge frame where the pairs are terminated, connecting to the voice line cards on the next floor above. The frame is split into a distribution side and an exchange side.

![The Main Distribution Frame, where thousands of copper pairs are terminated.](/content/images/2021/02/D6EbTyVW4AAIt6k.webp)

![Another view of the MDF.](/content/images/2021/02/D6EbTxqXoAADoTw.webp)

![Close-up of the MDF terminations.](/content/images/2021/02/D6EbTxEXkAY9BX6.webp)

![Another view of the MDF terminations.](/content/images/2021/02/D6EbTwSXkAAzFJ0.webp)

Everything is powered by DC power, not AC. Uninterruptible power supplies keep the power grid up, whilst the generators can take up to 5 minutes to start, sync, and take the load. Everything is monitored and tickets are automatically raised, should a fault occur.

![DC power distribution and uninterruptible power supplies.](/content/images/2021/02/D6EbURiXoAI8_Gy.webp)

![Another view of the DC power equipment.](/content/images/2021/02/D6EbUSKWAAETxZT.webp)

These line cards are what generates the dial tone, and interface between the analogue copper cables and the digital processing cards. They listen for DTMF tones from your telephone handset, and decode those to the digits you dialled. Lookup tables decide where to route calls.

![A bank of line cards that generate dial tone and interface copper to digital.](/content/images/2021/02/D6EbUyfX4Agm-QF.webp)

Now we're on to the modern IP network, known as 21CN. These yellow fibre cables range from 100Mbps to 10Gbps. Another rack holds an Alcatel Lucent router that handles 50% of Manchester's IP traffic. The other 50% is handled in a rack twenty feet away.

![Yellow fibre cables and the Alcatel-Lucent router carrying half of Manchester's IP traffic.](/content/images/2021/02/D6EbVSyXkAAOMJg.webp)

And finally, these are the CDN nodes for some very big well known Internet providers. Think video streaming and other high bandwidth users. They install their kit and have direct access to the IP routers downstairs. This reduces the transit cost to transport streaming media.

![A CDN rack installed in the exchange for a major streaming provider.](/content/images/2021/02/D6EbV4oWAAAtWCj.webp)

![Another CDN rack.](/content/images/2021/02/D6EbV59WwAA_OCc.webp)

![Another CDN rack.](/content/images/2021/02/D6EbV6GWsAADZ48.webp)

![Another CDN rack.](/content/images/2021/02/D6EbV6wXoAIhv0t.webp)

I love being a Software Engineer, but there's something so satisfying about physical infrastructure - especially hidden infrastructure that people take for granted.
