import {
    AutocompleteInteraction,
    CommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export interface SlashCommand {
    command: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => void;
    cooldown?: number;
}

export interface DiscordCommandEnrollResponse {
    id: string;
    application_id: string;
    version: string;
    default_permission: boolean;
    default_member_permissions: any;
    type: number;
    nsfw: boolean;
    name: string;
    name_localizations: any;
    description: string;
    description_localizations: any;
    guild_id: string;
}

export interface Command {
    name: string;
    execute: (message: Message, args: Array<string>) => void;
    permissions: Array<PermissionResolvable>;
    aliases: Array<string>;
    cooldown?: number;
}

declare module 'discord.js' {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
        commands: Collection<string, Command>;
        cooldowns: Collection<string, number>;
    }
}
