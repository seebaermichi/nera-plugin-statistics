const { getConfig } = require('../plugin-helper')

module.exports = (() => {

  const getStatistic = data => {
    const config = getConfig(`${__dirname}/config/statistics.yaml`)
    const statistics = {}

    config.count.forEach(element => {
      statistics[element] = []

      data.pagesData.forEach(({ meta }) => {
        if (meta[element]) {
          if (statistics[element].some(({ name }) => name === meta[element])) {
            statistics[element] = statistics[element].map(item => {
              if (item.name === meta[element]) {
                return {
                  name: item.name,
                  amount: ++item.amount
                }
              } else {
                return item
              }
            })
          } else {
            statistics[element].push({
              name: meta[element],
              amount: 1
            })
          }
        }
      })

      statistics[element].sort((a, b) => {
        const testA = a.name.toUpperCase()
        const testB = b.name.toUpperCase()

        return (testA < testB) ? -1 : (testA > testB) ? 1 : 0
      })
    });

    return statistics
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        statistics: getStatistic(data)
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
