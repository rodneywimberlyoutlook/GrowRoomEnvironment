﻿using GrowRoomEnvironment.Contracts.Email;

namespace GrowRoomEnvironment.Core.Email
{
    public class SmtpConfig : ISmtpConfig
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool UseSSL { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
    }
}