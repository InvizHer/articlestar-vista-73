
import React from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/common/PageHeader";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          title="About Us"
          description="Learn more about BlogHub and our mission to share knowledge and insights."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              BlogHub started as a small personal blog in 2015, born out of a passion for web development and design. What began as a platform to share personal learnings quickly grew into a community-driven knowledge base.
            </p>
            <p className="text-muted-foreground mb-4">
              Today, we've evolved into a comprehensive resource for developers, designers, and technology enthusiasts. Our mission is to demystify complex technical concepts and inspire the next generation of digital creators.
            </p>
            <p className="text-muted-foreground">
              We believe in open access to knowledge and the power of shared experience. Through our articles, tutorials, and community discussions, we aim to foster growth and innovation in the tech community.
            </p>
          </div>

          <div className="bg-muted rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg"
              alt="About BlogHub"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <div key={member} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-muted">
                  <img
                    src="/placeholder.svg"
                    alt={`Team Member ${member}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">Team Member {member}</h3>
                <p className="text-muted-foreground mb-2">Job Title</p>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-muted p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">Quality Content</h3>
              <p className="text-muted-foreground">
                We strive to provide well-researched, accurate, and valuable content that helps our readers solve real problems.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-muted-foreground">
                We value the input and participation of our community members, and aim to create an inclusive space for learning.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Continuous Learning</h3>
              <p className="text-muted-foreground">
                We believe in the power of lifelong learning and staying curious about new technologies and methodologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
