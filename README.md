# Statistics - Nera plugin
This is a plugin for the static side generator [nera](https://github.com/seebaermichi/nera) to create a simple statistic.  
It just counts how often a property defined in the config exists in all pages.

## Usage
The only thing you need to do is to place this plugin in the `src/plugins` folder of your nera project.  

In addition you need to define which properties are from interest in the `config/statistics.yaml`. For example like this:
```yaml
count:
  - category
  - topic
```
If you now define a property named category in you Markdownfiles its value will be counted.

You can then use the template `views/statistics.yaml` as an example and place it whereever you would like to see the statistic of your website.
