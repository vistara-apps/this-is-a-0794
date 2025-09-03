# PixelSpark

![PixelSpark Logo](https://via.placeholder.com/150x150?text=PixelSpark)

**Effortless Graphics. Instantly Shareable.**

PixelSpark is a web application that allows users to quickly create professional-looking graphics using templates and AI-powered editing, with easy sharing options.

## Features

### Template Library Access
Browse and select from a curated library of professionally designed graphic templates for various use cases (social media, presentations, etc.).

### AI Background Removal
Automatically remove the background from uploaded images with a single click, allowing for easy integration into designs.

### One-Click Export & Share
Quickly export your created graphics in common formats (PNG, JPG) and share them directly via a generated link or to popular social platforms.

### Project Organization
A simple dashboard to organize created projects, allowing you to save, categorize, and revisit your designs.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI API for background removal and design suggestions
- **Payments**: Stripe for subscription management

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for subscription features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pixelspark.git
cd pixelspark
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
pixelspark/
├── docs/                  # Documentation
│   ├── api.md             # API documentation
│   ├── supabase.md        # Supabase integration guide
│   ├── openai.md          # OpenAI integration guide
│   └── stripe.md          # Stripe integration guide
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   ├── editor/        # Design editor components
│   │   ├── layout/        # Layout components
│   │   ├── projects/      # Project management components
│   │   ├── sharing/       # Sharing components
│   │   ├── subscription/  # Subscription components
│   │   ├── templates/     # Template components
│   │   └── ui/            # UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and API clients
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
├── .env.example           # Example environment variables
├── index.html             # HTML template
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.js         # Vite configuration
```

## Subscription Tiers

### Free Tier
- Access to basic templates
- Limited exports (5/month)
- Standard quality exports
- Community support

### Pro Tier ($5/month)
- Access to all templates
- Unlimited exports
- High quality exports
- AI background removal
- Priority support

### Premium Tier ($15/month)
- Access to all templates
- Unlimited exports
- Maximum quality exports
- Advanced AI tools
- Custom branding
- Team collaboration
- Priority support

## API Documentation

For detailed API documentation, see the following guides:

- [API Overview](docs/api.md)
- [Supabase Integration](docs/supabase.md)
- [OpenAI Integration](docs/openai.md)
- [Stripe Integration](docs/stripe.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [Stripe](https://stripe.com/)
- [shadcn/ui](https://ui.shadcn.com/)

