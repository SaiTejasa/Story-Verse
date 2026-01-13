import { Universe } from './types';

export const UNIVERSES: Universe[] = [
  {
    id: 'ssu',
    name: 'Shouryanagar Universe',
    description: 'The definitive saga of Shouryanagar, where modern heroes clash with ancient horrors in an epic struggle for the soul of the city.',
    color: 'border-purple-500',
    accent: 'text-purple-500',
    series: [
      {
        name: 'TS Series (OG)',
        seasons: [
          {
            name: 'Main Saga',
            stories: [
              { id: 'ssu-1', title: 'The Legend Of Shouryanagar', path: 'https://drive.google.com/uc?export=download&id=1FvRzSnoIxoNVjWMqS1AAsDkIRuRVHY6R', universe: 'ssu', order: 1 },
              { id: 'ssu-2', title: 'OG Of Shouryanagar', path: 'https://drive.google.com/uc?export=download&id=11_kUx1cdFFUBQs0SXm5wnQXUs_7WLOzQ', universe: 'ssu', order: 2 },
              { id: 'ssu-3', title: 'The Return Of Horror And Tejas', path: 'https://drive.google.com/uc?export=download&id=1IeabDHJS2eHL-Z2Un2iJZlMYdGIdZVwe', universe: 'ssu', order: 3 },
              { id: 'ssu-4', title: 'Mysteries Of Shouryanagar', path: 'https://drive.google.com/uc?export=download&id=1lO3l7J_kx8UWlUxVcoMjoXvoJphrs4T5', universe: 'ssu', order: 4 },
            ]
          }
        ]
      }
    ],
    standaloneStories: [
      { id: 'ssu-sa-1', title: 'Magical Sword', path: 'https://drive.google.com/uc?export=download&id=1Kz4lQs-uFYKWuGdfH7GXcbiRVg6BSUxh', universe: 'ssu', order: 1 }
    ]
  },
  {
    id: 'legend',
    name: 'Legend Verse',
    description: 'A realm of lightning-fast warriors and super-powered guardians protecting the legacy of the chosen few.',
    color: 'border-blue-500',
    accent: 'text-blue-500',
    series: [
      {
        name: 'Guardians of Legend',
        seasons: [
          {
            name: 'Sai Tejas Collection',
            stories: [
              { id: 'lv-1', title: 'Arjun The Lightning Guardian', path: 'https://drive.google.com/uc?export=download&id=1GsrEVeiU8MhJSxrXjVRKbRlfxs5OktCA', universe: 'legend', order: 1 },
              { id: 'lv-2', title: 'The Legend Of Veer', path: 'https://drive.google.com/uc?export=download&id=1e6hrVw9fZHSjmkyl2Z2VrasL98STop0F', universe: 'legend', order: 2 },
              { id: 'lv-3', title: 'The Rise Of Super Sher', path: 'https://drive.google.com/uc?export=download&id=1dpPqKJnzz4OeqX9Eo-dNS0BKk_ls8Vwg', universe: 'legend', order: 3 },
              { id: 'lv-4', title: 'The Unknown Letter', path: 'https://drive.google.com/uc?export=download&id=1e0-eVa4_xjqLg5W_t36vRi5EE51WJrHI', universe: 'legend', order: 4 },
              { id: 'lv-5', title: 'The Legacy Of Tejas', path: 'https://drive.google.com/uc?export=download&id=1drQKEPsTYtrw7e0zPxA36K5z8jQKSjfD', universe: 'legend', order: 5 },
              { id: 'lv-6', title: 'The Rise Beyond Shadows', path: 'https://drive.google.com/uc?export=download&id=1drvETtZ8QpO1ajmUYMt3IfOKxo3XreDx', universe: 'legend', order: 6 },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'agnitech',
    name: 'Agni Tech Vishwa',
    description: 'Where technology and ancient mysticism collide. Chronicles of mechanical spirits and digital protectors.',
    color: 'border-red-500',
    accent: 'text-red-500',
    series: [
      {
        name: 'Technical Chronicles',
        seasons: [
          {
            name: 'Part 1 Series',
            stories: [
              { id: 'av-1', title: 'Game Rakshak (Part 1)', path: 'https://drive.google.com/uc?export=download&id=1altCwnsdd68_2aNAp-mxp2pxtGsIrMNH', universe: 'agnitech', order: 1 },
              { id: 'av-2', title: 'Naag Yantra (Part 1)', path: 'https://drive.google.com/uc?export=download&id=1apEG0JAogS5fb4AKNGjSjLT7AlatIKEv', universe: 'agnitech', order: 2 },
              { id: 'av-3', title: 'AntarManav (Part 1)', path: 'https://drive.google.com/uc?export=download&id=1apvNKYuDfXAmOMsO5cWlNJkM5gUu1wy3', universe: 'agnitech', order: 3 },
              { id: 'av-4', title: 'Kapal Kundli (Part 1)', path: 'https://drive.google.com/uc?export=download&id=1rz2t1dBAGlbDcqlmbfhCYzuUii8Ux0AS', universe: 'agnitech', order: 4 },
            ]
          }
        ]
      }
    ]
  }
];