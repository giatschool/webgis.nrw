import geostats from 'geostats';

export default class Statistics {
  static getEqualInterval(data, number_of_classes) {
    const serie = new geostats(data);
    console.log(serie.getClassEqInterval(number_of_classes));

    return serie.getClassEqInterval(number_of_classes);
  }
}
