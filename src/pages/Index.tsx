import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/FloatingParticles";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Sparkles, ArrowRight, Star, Users, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 max-w-5xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold"
          >
            <Sparkles className="h-4 w-4 text-warning" />
            <span className="text-gradient-primary">#1 Team Recognition Platform</span>
            <Star className="h-4 w-4 text-warning" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9]"
          >
            <span className="text-gradient-primary">Brag</span>
            <span className="text-gradient-secondary">Board</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Celebrate every win, recognize your team, and build a culture of
            <span className="text-primary font-semibold"> appreciation</span> that drives
            <span className="text-secondary font-semibold"> success</span>.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 py-4"
          >
            {[
              { icon: Users, label: "Active Users", value: "10K+" },
              { icon: Star, label: "Shout-outs", value: "50K+" },
              { icon: Zap, label: "Real-time", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="relative overflow-hidden group bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg py-7 px-10 rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="lg"
              className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary hover:scale-[1.02] transition-all duration-300 text-lg py-7 px-10 rounded-2xl"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-5xl mt-20"
        >
          <h2 className="text-center text-2xl font-bold mb-8">
            Everything you need to{" "}
            <span className="text-gradient-rainbow">celebrate wins</span>
          </h2>
          <FeatureShowcase />
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 glass-card rounded-2xl p-8 max-w-lg text-center"
        >
          <p className="text-muted-foreground italic mb-4">
            "BragBoard transformed our team culture. Recognition is now part of our DNA!"
          </p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <p className="text-sm font-semibold mt-2">— Sarah, Engineering Manager</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
