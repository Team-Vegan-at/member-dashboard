import moment from 'moment';

export class CalcUtil {

  static getCurrentMembershipYear() {

    if (moment().utc().month() === 11) {
      return moment().utc().add(1, "year").year();
    } else {
      return moment().utc().year();
    }

  }
}
