import Moment from "moment";

export function MomentES(value) {
  return Moment(value).locale("es").format("DD/MM/YYYY").toString();
}
