export interface CommandOption {
    type: number;
    name: string;
    description: string;
    required: boolean;
    choices?: any;
}

export interface Command {
    name: string;
    description: string;
    options: CommandOption[];
}
