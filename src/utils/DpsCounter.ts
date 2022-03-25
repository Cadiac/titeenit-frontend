import dayjs, { Dayjs } from 'dayjs';

export class DpsCounter {
  dmgs: { dmg: number; time: Dayjs }[] = [];
  keepout = 'https://keepout.netlify.app/';
  active = false;
  dmgtimeout: any = null;
  public addDamage = (dmg: number) => {
    if (dmg != 0) {
      this.active = true;
    }
    if (this.dmgs.length >= 10) {
      this.dmgs.shift();
    }
    this.dmgs.push({ dmg, time: dayjs() });
    if (this.dmgtimeout) {
      clearTimeout(this.dmgtimeout);
    }
    this.dmgtimeout = setTimeout(() => {
      this.dmgs = [];
      this.active = false;
    }, 11000);
  };
  public dps = (): string => {
    const dmgarray = this.dmgs.slice();
    if (!this.active || this.dmgs.length < 1) {
      return '0';
    }
    if (this.dmgs.length === 1) {
      return this.dmgs[0].dmg.toString();
    }
    const oldestItem = dmgarray[0];
    if (!oldestItem) {
      return '0';
    }
    return `${(
      dmgarray.reduce((acc, value) => {
        return acc + value.dmg;
      }, 0) / dayjs().diff(oldestItem.time, 's')
    ).toFixed(2)}`;
  };
}
