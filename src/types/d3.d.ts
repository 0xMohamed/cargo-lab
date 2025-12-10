declare module "d3" {
  export function scaleBand(): {
    domain(data: string[]): any;
    range(range: [number, number]): any;
    padding(padding: number): any;
    bandwidth(): number;
  };

  export function scaleLinear(): {
    domain(domain: [number, number]): any;
    range(range: [number, number]): any;
  };

  export function select(selector: string | Element): {
    selectAll(selector: string): {
      remove(): any;
      data(data: any[]): {
        enter(): {
          append(type: string): {
            attr(name: string, value: any): any;
          };
        };
        exit(): {
          remove(): any;
        };
        merge(other: any): {
          attr(name: string, value: any): any;
        };
      };
    };
    append(type: string): {
      attr(name: string, value: any): any;
    };
  };
}
