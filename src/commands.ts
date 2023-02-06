export const TEST_COMMAND = {
    name: 'test',
    description: '기본적인 command',
    type: 1,
};

export const ECHO_COMMAND = {
    name: 'echo',
    description: '말하는 그대로 메아리칩니다.',
    options: [
        {
            type: 3,
            name: 'message',
            description: 'The message to echo',
            required: true,
        },
    ],
};
