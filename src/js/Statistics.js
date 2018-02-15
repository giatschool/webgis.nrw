import geostats from 'geostats';

export default class Statistics {
  static getEqualInterval(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassEqInterval(number_of_classes);
  }

  static getClassStdDeviation(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassStdDeviation(number_of_classes);
  }

  static getClassArithmeticProgression(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassArithmeticProgression(number_of_classes);
  }

  static getClassGeometricProgression(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassGeometricProgression(number_of_classes);
  }

  static getClassQuantile(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassQuantile(number_of_classes);
  }

  static getClassJenks(data, number_of_classes) {
    const serie = new geostats(data);

    return serie.getClassJenks(number_of_classes);
  }

  static getRanges(data) {
    const serie = new geostats(data);

    return serie.getRanges();
  }
}
