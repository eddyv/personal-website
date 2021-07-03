---
title: Blog Post Elements
published: true
description: This is my very first blog post! It contains a variety of examples to show what your markdown files will look like out of the box after gridsome & vuejs is done with them.
tags: gridsome
date_published: "2021-07-03"
og_image: ./og/ogImage.png
og_image_description: Powered by gridsome
author: Edward Vaisman
---

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

This is a standard paragraph. There isn't much more to say about what all is going on here, but I'll babble for a bit so you can see what the prose class looks like for a longer paragraph.

> Here is a standard blockquote. Sometimes you want to include a quote in your document - TV

Or maybe you want to see what a bulleted list looks like:

- Bullet item 1
- Bullet item 2
- Bullet item 3

Or maybe an ordered list:

1. Numbered Item 1
2. Numbered Item 2
3. Numbered Item 3

How about an inline `code block`?

```json
{
  "what": {
    "about": {
      "a-multi-line": "code block?"
    }
  }
}
```

### What about nested lists?

Nested lists basically always look bad which is why editors like Medium don't even let you do it, but I guess since some of you goofballs are going to do it we have to carry the burden of at least making it work.

1. **Nested lists are rarely a good idea.**
   - You might feel like you are being really "organized" or something but you are just creating a gross shape on the screen that is hard to read.
   - Nested navigation in UIs is a bad idea too, keep things as flat as possible.
   - Nesting tons of folders in your source code is also not helpful.
2. **Since we need to have more items, here's another one.**
   - I'm not sure if we'll bother styling more than two levels deep.
   - Two is already too much, three is guaranteed to be a bad idea.
   - If you nest four levels deep you belong in prison.
3. **Two items isn't really a list, three is good though.**
   - Again please don't nest lists if you want people to actually read your content.
   - Nobody wants to look at this.
   - I'm upset that we even have to bother styling this.

### Here's a table!

| Wrestler                | Origin       | Finisher           |
| ----------------------- | ------------ | ------------------ |
| Bret "The Hitman" Hart  | Calgary, AB  | Sharpshooter       |
| Stone Cold Steve Austin | Austin, TX   | Stone Cold Stunner |
| Randy Savage            | Sarasota, FL | Elbow Drop         |
| Vader                   | Boulder, CO  | Vader Bomb         |
| Razor Ramon             | Chuluota, FL | Razor's Edge       |

### Lastly, an image


It's probably important that images look okay here by default as well:

<figure>
  <img
    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80"
    alt=""
  />
  <figcaption>
    Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
    classical Latin literature from 45 BC, making it over 2000 years old.
  </figcaption>
</figure>


[And don't forget to visit the Tailwind Typography plugin!](https://github.com/tailwindlabs/tailwindcss-typography)
