import Strategy from './strategy';
import Transport from 'shared/transport';
import StrategyOptions from './strategy_options';
export default class TransportStrategy implements Strategy {
    name: string;
    priority: number;
    transport: Transport;
    options: any;
    constructor(name: string, priority: number, transport: Transport, options: StrategyOptions);
    isSupported(): boolean;
    connect(minPriority: number, callback: Function): {
        abort: () => void;
        forceMinPriority: (p: any) => void;
    };
}
