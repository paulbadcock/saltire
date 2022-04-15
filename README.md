# saltire - hugo theme

![sample screenshot](https://raw.githubusercontent.com/paulbadcock/saltire/main/static/img/sample-page.png "Screenshot" =250x250)


## How to use

Create a new site

```shell
hugo new site samplesite
```

Now clone this as a submodule

```shell
cd samplesite
git init
git submodule add https://github.com/paulbadcock/saltire.git themes/saltire
```

activate this theme in hugo's config in the config.toml

```shell
echo theme = \"saltire\" >> config.toml
```

To construct a menu, use the following

```toml
[menu]
    [[menu.main]]
        name = 'Home'
        url = ''
        weight = -110
    [[menu.main]]
        name = 'About'
        url = '/about'
        weight = -109
    [[menu.main]]
        name = 'Docs'
        url = '/docs'
        weight = -108
```
