import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime' })
export class RelativeTime implements PipeTransform {
  transform(value: string | Date): string {
    return new Date(value).toLocaleString();
  }
}
